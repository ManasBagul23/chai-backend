class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.success = true;

        if (statusCode < 200 || statusCode >= 300) {
            throw new Error("Invalid status code for a successful response");
        }
    }
}