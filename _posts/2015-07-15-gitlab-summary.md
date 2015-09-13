---
layout: post
title: GitLab 安装配置心得记录
description: GitLab 安装配置心得记录
categories: Tech
tags: GitLab
---

## GitLab 基础知识

GitLab 是一个开源的 Git 项目库管理程序，提供方便易用的 Web 界面，和友好的 API。

GitLab 是使用 Ruby on Rails 开发的。

### GitLab 架构

Web 访问路线：用户 -> Nginx -> Unicorn -> GitLab-Rails

Git over http 访问路线：用户 -> Nginx -> GitLab-Rails

Git over SSH 访问路线：用户 -> GitLab-shell

### 名词解释

Nginx：http 反向代理，接受用户的 http 请求，再转发到后端程序（Unicorn）。

Unicorn：一个 http 服务器，提供 GitLab 的 Web 服务。

GitLab-shell：GitLab 的 Git 命令处理程序。

GitLab-Rails：GitLab 本身的 Ruby on Rails 程序。

### 版本

GitLab 有两种版本：源码版本和 Omnibus 版本。源码版本就是直接在 GitHub 或者 GitLab 上 clone 下来的源代码，Omnibus 是一个安装包。

两个版本的安装配置差异比较大，我们组内使用的 GitLab 是源码版本。**这篇心得也是基于源码版本撰写的。**

## GitLab 基本维护

要运行起 GitLab 主要靠两个服务：GitLab 服务和 Nginx 服务。

GitLab 服务

```
root@mkt-git-01:~# service gitlab 
Usage: service gitlab {start|stop|restart|reload|status}
```

Nginx 服务

```
root@mkt-git-01:~# service nginx 
Usage: nginx {start|stop|restart|reload|force-reload|status|configtest}
```

GitLab 的用户：git

```
git:x:1000:1000:GitLab,,,:/home/git:/bin/bash
```

GitLab 程序的目录：

```
/home/git
```

### 重要配置文件

GitLab 配置

```
/home/git/gitlab/config/gitlab.yml
```

GitLab-shell 配置

```
/home/git/gitlab-shell/config.yml
```

Nginx 配置

```
/etc/nginx/sites-enabled/gitlab
```

其他 GitLab 配置文件的目录

```
/home/git/gitlab/config
```

## Rake Task

什么是 Rake Task？Rake Task 是一些用 Ruby 写的脚本，方便对程序进行批处理操作。

GitLab 的 Rake Task 需要 su 到 git 用户，然后在 /home/git/gitlab 目录执行。

### 查 GitLab 信息

```
bundle exec rake gitlab:env:info RAILS_ENV=production
```

### 检查 GitLab 配置

```
bundle exec rake gitlab:check RAILS_ENV=production
```

更多请见官方文档。

GitLab 的 Rake Task 存放在 /home/git/gitlab/lib/tasks 下面，我们可以参考里面的例子，野生学点 Ruby，然后自行编写一些批处理任务。

例如，把所有项目的可视程度设置到 private，代码来自 GitHub。

```ruby
namespace :gitlab do
  namespace :import do
    desc "GITLAB | Set all projects visibility level to 'private'"
    task all_to_private: :environment do |t, args|
      require 'acts_as_taggable_on/taggable/core'
      projects = Project.all
      projects.each do |project|
        if project.visibility_level != 0
          puts "Setting #{project.name}'s visibility_level to 'private'"
          project.visibility_level = 0
          project.save
        else
          puts "#{project.name}'s visibility_level is already 'private', skipping..."
        end
      end
    end
  end
end
```

## 遇到的坑和解决办法

整个升级过程里，遇到不少问题，这里记录一下。

### OpenID 配置

我们的 GitLab 是使用公司的 OpenID 登录的，如何整合 OpenID 进 GitLab，全网只有[这一篇](http://eric.van-der-vlist.com/blog/2013/11/23/how-to-customize-gitlab-to-support-openid-authentication/)步骤详细。

步骤记录：

1. 添加 openID 的 Gem 包进 Gemfile 里，重新 bundle install 一下。（可使用淘宝的 Gem 镜像，速度会快点）
2. 开启 config/gitlab.yml 里的 OmniAuth。
3. 配置 config/initializers/devise.rb，增加 OpenID 的内容。（devise 是一个控制第三方登录的包）
4. 配置 app/controllers/omniauth_callbacks_controller.rb，增加 OpenID 的内容。（这个 controller 是控制登录后的回调动作）
5. 配置 app/helpers/oauth_helper.rb，增加 OpenID 的内容。（应该是用户界面的东东）

具体请参见服务器上的配置文件。

### Git over http 的开启与禁止

SA 默认提供的 GitLab 关闭了 Git over http，找了很久很久，才从[一个帖子](https://groups.google.com/forum/#!topic/gitlabhq/TwrunEd1cps)找到解决方案。

/config/routes.rb 这个文件里的 Grack support 部分，控制了 Git over http 的请求。

/app/views/shared/_clone_panel.html.haml 这个文件，控制了界面的 http clone 按钮。

然后它们都给 SA 改掉了，也就是禁止了 Git over http 的行为。

### OpenID 登录 500 问题

升级 GitLab 后，很神奇地，正职员工登录， OpenID 服务器会返回 500 错误。

经过对比分析，发现升级后，OpenID 的登录请求带上了很多 openid.ax.type 参数，基本上定位了是这个问题导致。

查了一下源码，定位到问题出自文件 gitalb/vendor/bundle/ruby/2.1.0/gems/rack-openid-1.1.1/rack/openid.rb 里的 add_attribute_exchange_fields 函数，注释掉即可。

```ruby

...

begin
  oidreq = consumer.begin(identifier)
  add_simple_registration_fields(oidreq, params)
  # add_attribute_exchange_fields(oidreq, params)
  add_oauth_fields(oidreq, params)
  url = open_id_redirect_url(req, oidreq, params["trust_root"], params["return_to"], params["method"], immediate)
  return redirect_to(url)
rescue ::OpenID::OpenIDError, Timeout::Error => e
  env[RESPONSE] = MissingResponse.new
  return @app.call(env)
end

...

```

### OpenID 不能使用 GET 请求登录，只能使用 POST 请求

我们是用 Nginx 对登录请求 /user/sign_in 重定向到 /user/openid，以此进行跳转登录。然而，Nginx rewrite 是无法 rewrite 出 POST 请求的，只能是 GET。

其实，基于安全原因，GitLab 默认是只允许 POST 进行第三方登录的，不过我们可以修改文件 /home/git/gitlab/config/initializers/7_omniauth.rb，如下。

```ruby

...

OmniAuth.config.allowed_request_methods = [:get, :post]

...

```

添加进 get 方法就可以了。