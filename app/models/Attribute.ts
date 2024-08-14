interface AttributeKeyValue {
    key: string;
    value: string;
  }

  interface Attribute {
    id: number;
    name: string;
    description: string;
    states?: { id: number; attributeId: number; value: string; infSystems: any[] }[];
  }

  interface AttributeStatement {
    id: number;
    attributeId: number;
    attribute: Attribute;
    value: string;
    infSystems: any[];
  }