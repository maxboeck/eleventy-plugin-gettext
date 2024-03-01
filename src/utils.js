function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item)
}

function mergeDeep(target, source) {
    let dummy

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    dummy = {}
                    dummy[key] = {}
                    Object.assign(target, dummy)
                }
                mergeDeep(target[key], source[key])
            } else {
                dummy = {}
                dummy[key] = source[key]
                Object.assign(target, dummy)
            }
        }
    }
    return target
}

module.exports = {
    isObject,
    mergeDeep
}
