 

Array.prototype.RemoveDupes = function () {
   
    var uniqueNames = [];
    $.each(this, function (i, el) {
        if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });

    return uniqueNames;
};