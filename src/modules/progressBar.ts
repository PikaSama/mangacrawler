import * as slog from 'single-line-log';
class ProgressBar {
    description: string;
    bar_length: number;
    constructor(description, bar_length) {
        this.description = description;
        this.bar_length = bar_length;
    }
}