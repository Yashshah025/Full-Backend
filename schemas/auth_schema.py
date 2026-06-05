from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=8, max=20))
    role = fields.Str(load_default="customer")

class LoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)

        