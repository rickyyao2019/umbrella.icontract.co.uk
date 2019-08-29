(function (nav) {
    var raf = requestAnimationFrame,
        classList = nav.classList,
        duration = 3000, //auto-hide menu in 3 seconds
        initialScroll = 0,
        timeout;

    function show()       {
        classList.remove('hidden');
    }

    function hide()       {
        classList.add('hidden');
    }
    function isActive()   { return nav.classList.contains('active'); }
    function autohide()   { if (!isActive()) { raf(hide); } }
    function deactivate() { classList.remove('active'); }
    function pin()        { classList.add('pinned'); }
    function unpin()      { classList.remove('pinned'); }

    function render() {
        var currentScroll = window.pageYOffset,
            deltaScroll = currentScroll - initialScroll;
        // When on top of the page
        if (!currentScroll) {
            clearTimeout(timeout);
            show();
        // When scrolling back
        } else if (deltaScroll < -10) {
            clearTimeout(timeout);
            show();
            timeout = setTimeout(autohide, duration);
        // When scrolling down
        } else if (deltaScroll > 10)  {
            hide();
            deactivate();
        }
        currentScroll > 50 ? pin() : unpin();
        initialScroll = currentScroll;
    }
    function onBurgerClick() { nav.classList.toggle('active'); }

    function referLink() {
      var referralUrl = new Url(window.location.href);
      var referralQuery = referralUrl.query;
      var referralId = referralQuery.referral_id;
      if (referralId) {
          var registerElement = nav.querySelector('.register');
          registerElement.href = `${registerElement.href}?referral_id=${referralId}`;
      }
    }

    window.addEventListener('scroll', function () { raf(render); });
    nav.querySelector('.burger').addEventListener('click', onBurgerClick);

    referLink();
    render();
}(document.querySelector('.menu')));
