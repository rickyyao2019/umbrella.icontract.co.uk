exports.$ = function (node, selector) {
    if (!selector) {
        selector = node;
        node = document;
    }
    var r = node.querySelector(selector);
    return r;
};
exports.$$ = function (node, selector) {
    if (!selector) {
        selector = node;
        node = document;
    }
    var r = Array.prototype.slice.call(node.querySelectorAll(selector));
    return r;
};
