
interface CreateInfSystemRequest {
    name: string;
    description: string;
    attributeKeys: string[];
    attributeValues: string[];
  }
  interface InformationSystem {
    id: number;
    name: string;
    description: string;
    attributeStatements: {
      id: number;
      attributeName: string;
      attributeId: number;
      attribute: Attribute;
      value: string;
    }[];
  }