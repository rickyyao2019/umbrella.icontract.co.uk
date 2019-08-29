/*eslint indent:[1,4]*/
var html = document.documentElement;

function mailcheck(string) {
    return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/i.test(string);
}
function success(form) {
    form.classList.add('confirm');
    form.classList.remove('loading');
}
function onError(data, form) {
    form.classList.remove('loading');
    form.classList.add('error');
}
function generateDate(n) {
    var addZero = function (x) { return x.toString().replace(/^\d{1}$/, '0$&'); },
        d = addZero(n.getDate()),
        m = addZero(n.getMonth() + 1),
        y = n.getFullYear();
    return d + '-' + m + '-' + y;
}
function onSubmit(e) {
    e.preventDefault();
    var form   = e.target,
        array  = Array.prototype.slice,
        fields = array.call(form.querySelectorAll('[name]')),
        data   = {},
        req,
        field,
        i;
    form.classList.remove('error');
    for (i = 0; i < fields.length; i += 1) {
        field = fields[i];
        const value = field.type === 'checkbox' ? field.checked : field.value;

        if (!value && field.required) {
            form.classList.add('error');
            form.setAttribute('data-warning',
             'Please fill the missing "' + field.placeholder + '" field');
            return;
        }
        if (field.type === 'email') {
            if (!mailcheck(value)) {
                form.classList.add('error');
                form.setAttribute('data-warning',
                 'Please provide a valid email address for "'
                 + field.placeholder + '"');
                return;
            }
        }
        data[field.name] = value;
    }

    function onResponse() {
        var res = this.responseText;
        try {
            res = JSON.parse(res);
        } catch (error) { return onError(data, form); }
        if (res.error) { return onError(data, form); }
        success(form);
    }

    data.type = document.documentElement.classList.contains('contractor') ? 'contractor' : 'recruiter';
    data.created_at = new Date().toJSON();

    req = new XMLHttpRequest();
    req.addEventListener('load', onResponse);
    req.open('POST', 'https://sheetsu.com/apis/v1.0/9b72944e8430');
    req.setRequestHeader('Content-Type', 'application/json');
    form.classList.add('loading');
    //setTimeout(success, 3000);
    req.send(JSON.stringify(data));
}
module.exports = function (form) {
    form.onsubmit = onSubmit;
    form.onchange = function (e) {
        e.currentTarget.removeAttribute('data-warning');
        e.currentTarget.classList.remove('error');
    };
};
