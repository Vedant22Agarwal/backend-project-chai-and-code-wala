class ApiResponse {// DB se kuch data aa gaya ab bs bhejna h 
    constructor(statusCode,data,message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = statusCode < 400;
    }
}