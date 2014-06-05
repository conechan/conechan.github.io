'use strict';
jQuery(function($){
  $('.archive ul').addClass('hidden');

  var currentTime = new Date($.now());
  var currentYear = currentTime.getFullYear();

  $('.archive ul').each(function(i, elem) {
    if ($(this).attr('id').replace('year', '') == currentYear) {
      $(this).removeClass('hidden');
    }
  });

  $('.archive-year').on('click', function(){
    var ulYearID = '#year' + $(this).text();
    var archiveYearID = '#y' + $(this).text();
    $('.archive ul').addClass('hidden');
    $(ulYearID).removeClass('hidden');
    $('html, body').animate({
      scrollTop: $(archiveYearID).offset().top - 20
    }, 100);
  });
});