export class ResponseData<D> {
    data: D | D[];
    statuscode: number;
    message: string;
    constructor(data: D | D[], statuscode: number, message: string) {
        this.data = data;
        this.statuscode = statuscode;
        this.message = message;
        return this;
    }
}