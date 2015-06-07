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