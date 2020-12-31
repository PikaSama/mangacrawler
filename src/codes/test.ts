const Logger = {
    textCache: '',
    info(message) {
        return message;
    },
    get(val) {
        console.log(val);
    }
}
Logger.info('a').get();