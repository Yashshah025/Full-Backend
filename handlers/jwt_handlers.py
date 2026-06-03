from flask_jwt_extended import JWTManager


def register_jwt_callbacks(jwt):

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return {
            "error": "Token expired"
        }, 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return {
            "error": "Invalid token"
        }, 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return {
            "error": "Authorization token required"
        }, 401

    @jwt.revoked_token_loader
    def revoked_callback(jwt_header, jwt_payload):
        return {
            "error": "Token revoked"
        }, 401