/*eslint indent:[1,4]*/
var $ = require('../../lib/utils').$,
    share = require('../../lib/share');
function mailcheck(string) {
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i.test(string);
}
function parseSnippet(snippet) {
    var title = document.createElement('h2');
    title.textContent = $(snippet, 'h3').textContent;
    return {
        img: $(snippet, 'img'),
        title: title,
        description: $(snippet, 'p')
    };
}
function generateActivationForm() {
    var f = document.createElement('form');
    f.setAttribute('novalidate', '');
    f.className = 'unlock';
    f.innerHTML = `
        <legend>
          Tell us a bit about yourself to access this guide..
        </legend>
        <select name=sector required>
          <option disabled value selected>Your sector</option>
          <option>Financial Services</option>
          <option>Tech</option>
          <option>Law</option>
        </select>
        <label class=consent>
          <input type=checkbox name=consent required>
          Please tick to consent to receiving this guide and other news from us by email in accordance with our
          <a href="/privacy.html" class="inline-link">Privacy Policy</a>. You may download all our other guides
          without further consent or if you <a href="https://app.icontract.co.uk/?utm_source=Main%20site&utm_medium=Referral&utm_campaign=Main%20site&utm_term=Main%20site" class="inline-link">
          register here</a> as a user.
        </label>
        <label class=email>
          <input type=email name=email placeholder='email address' required>
          <button>Get it Free</button>
        </label>`;
    return f;
}
function generatePreview(data) {
    var p = document.createElement('div'),
        figure = document.createElement('figure'),
        content = document.createElement('div');
    p.className = 'section preview';

    figure.appendChild(data.img);
    content.appendChild(data.title);
    content.appendChild(data.description);
    content.appendChild(share());
    content.appendChild(generateActivationForm());

    p.appendChild(figure);
    p.appendChild(content);
    return p;
}
function showCallToAction() {
    const aside = document.createElement('aside');
    aside.className = 'cta hidden';
    aside.innerHTML = ''
        + '<span class=close></span>'
        + '<h2>Enjoying this article?</h2>'
        + '<p>Join our network and put it into practice.</p>'
        + '<a href="https://app.icontract.co.uk/?utm_source=Main%20site&utm_medium=Referral&utm_campaign=Main%20site&utm_term=Main%20site" class=button>Register</a>';
    aside.querySelector('.close').onclick = function () {
        aside.dismissed = true;
        aside.classList.add('hidden');
    };
    function getDocumentHeight() {
        var body = document.body,
            html = document.documentElement;
        return Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );
    }
    function checkVisibility() {
        if (aside.classList.contains('hidden') && !aside.dismissed) {
            aside.classList.remove('hidden');
        }
    }
    window.addEventListener('scroll', () => {
        const percentage = pageYOffset * 100 / getDocumentHeight();
        if (percentage > 15) {
            requestAnimationFrame(checkVisibility);
        }
    });
    return aside;
}
function subscribeUser(data, cb) {
    var req = new XMLHttpRequest();
    req.addEventListener('load', cb);
    req.open('POST', 'https://sheetsu.com/apis/v1.0/cd6e994eace7');
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(data));
}

module.exports = function () {
    var article = $('.article-container'),
        pathname = location.pathname.replace(/^\//, '').split('/').reverse()[0],
        snippet = $('article a[href*="' + pathname + '"]'),
        preview;
    if (!snippet) { return; }
    function enterReadingMode() {
        $(article, 'main').appendChild(share());
        article.appendChild(showCallToAction());
    }
    snippet.parentElement.parentElement.removeChild(snippet.parentElement);
    if (document.cookie.match('resource_unlocked=true')) {
        return enterReadingMode();
    }
    preview = generatePreview(parseSnippet(snippet));
    article.parentElement.replaceChild(preview, article);
    $('.preview form').onsubmit = function (e) {
        var form = e.currentTarget;
        e.preventDefault();
        if (!form.sector.value) {
            form.setAttribute('data-warning', 'Please choose a sector');
            return;
        }
        if (!form.consent.checked) {
            form.setAttribute('data-warning', 'Please tick to give your consent');
            return;
        }
        if (!mailcheck(form.email.value)) {
            form.email.focus();
            form.setAttribute('data-warning',
                              'Please provide a valid email address');
            return;
        }
        subscribeUser(
            {
                email: form.email.value,
                sector: form.sector.value,
                page: document.title
            },
          function () {
              window.scrollTo(0,0);
              document.body.replaceChild(article, preview);
              document.cookie='resource_unlocked=true;max-age=' + 31536e3;
              enterReadingMode();
          }
       );
    };
};
