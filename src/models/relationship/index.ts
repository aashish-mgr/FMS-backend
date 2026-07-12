import { roleRelationship } from "./roleRelationship";
import { transactionRelationships } from "./transactionRel";
import { remainderRelationship } from "./remainderRelationship";
import { noteRelationship } from "./noteRelationship";

const applyRelationship = () => {
 
  roleRelationship();
  transactionRelationships();
  remainderRelationship();
  noteRelationship();
};

export { applyRelationship };
