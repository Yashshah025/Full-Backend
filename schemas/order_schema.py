from marshmallow import Schema, fields, validate

class OrderSchema(Schema):

    quantity = fields.Int(load_default=1, validate=validate.Range(min=1))