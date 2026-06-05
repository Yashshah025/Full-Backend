from marshmallow import fields, validate, Schema

class DrinkSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1,max=100))
    description = fields.Str(required=True, validate=validate.Length(min=1,max=120))
    price = fields.Float(required=True, validate=validate.Range(min=0.01))

class DrinkUpdateSchema(Schema):
    name = fields.Str(validate=validate.Length(min=1, max=100))
    description = fields.Str(validate=validate.Length(min=1, max=120))
    price = fields.Float(validate=validate.Range(min=0.01))