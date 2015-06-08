$(document).ready( function() {  
    $('.isotope').isotope({
        layoutMode: 'packery',
        itemSelector: '.col',
        packery: {
            gutter: 0
        }
    });
});

$(document).ready(function() {
    $('#right-menu').sidr({
      name: 'sidr-right',
      side: 'right'
    });
});

$(document).ready(function(){
    $('.btn-floating').click(function(){
        $('.search').slideToggle();
    });
});

$('.button-collapse').sideNav({
    menuWidth: 240, // Default is 240
    edge: 'left', // Choose the horizontal origin
    closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
    dismissible: true
    }
  );