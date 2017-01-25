module.exports = {
    liesBetween: (num, a, b) => {
        // Checkes whether num lies between a and b
        if((num >= a && num <= b) || (num <= a && num >= b)) {
            return true;
        }
        return false;
    },

    extend: (dest, src) => {
        for(let key in src) {
            dest[key] = src[key];
        }
        return dest;
    }

};
