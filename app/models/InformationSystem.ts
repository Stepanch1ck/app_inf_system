
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
      attributeId: number;
      attribute: Attribute;
      value: string;
    }[];
  }