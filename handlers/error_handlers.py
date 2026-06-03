from flask import jsonify
from sqlalchemy.exc import SQLAlchemyError

def register_error_handlers(app):
    @app.errorhandler(404)

    def not_found(error):
        return jsonify({
            "error": "Resource not found"
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "error": "Method not allowed"
        }), 405

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal server error"
        }), 500

    @app.errorhandler(Exception)
    def handle_exception(error):
        return jsonify({
            "error": "Something went wrong"
        }), 500
    
    
    @app.errorhandler(429)
    def ratelimit_handler(error):
        return jsonify ({
            "error": "Rate limit exceeded"
        }), 429