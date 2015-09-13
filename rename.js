var path = require('path');
var fs =require('fs');

fs.readdir('_posts', function (err, files) {

  files.forEach(function (fileName) {
    fs.renameSync('_posts/' + fileName, '_posts/__' + fileName);
      // console.log('git mv --force _posts/' + fileName + ' _posts/__' + fileName);
  });
});