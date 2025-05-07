import postgres from "../config/postgre";
import { randomCodeGenerator, randomNameGenerator } from "../utils/helperFunctions";
import { ChangeStatusDataType, CreateNewGadgetType, GadgetDataType, GetGadgetDetailsType, UpdateGadgetType } from "../types";



class GadgetModel {


  public async createNewGadget({ name, userId }: CreateNewGadgetType) {
    return (await postgres.db.query("INSERT INTO gadgets ( name, codename, created_by ) VALUES ($1, $2, $3) RETURNING * ", [name, randomNameGenerator(), userId])).rows[0];
  }



  public async updateGadget({ gadgetId, name, status }: UpdateGadgetType) {

    const fields: string[] = [];

    const values: string[] = [];

    let i: number = 1;


    /*
    i = 1; 

    field will be [ "name = $1 ", "status = $2 " ];

    values will be [ "name_value", "status_value " ];
    
    at last push gadgetId

    */

    if (name) {
      fields.push(`name = $${i++}`);
      values.push(name);
    }


    if (status) {
      fields.push(`status = $${i++}`);
      values.push(status);
    }


    // Store id in values
    values.push(gadgetId);


    const query: string = `UPDATE gadgets SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP  WHERE id = $${i} RETURNING * `;

    return (await postgres.db.query(query, values)).rows[0];

  }




  public async getGadgetDetails({ userId, gadgetId, status, name }: GetGadgetDetailsType) {


    if (gadgetId) {  // 1 --  Get specific gadget by ID

      return (await postgres.db.query("SELECT * FROM gadgets WHERE id = $1 AND created_by = $2", [gadgetId, userId])).rows[0];

    } else if (status || name) { // 2 -- Filter gadgets by status and/or name

      let query: string = "SELECT * FROM gadgets WHERE created_by = $1";

      const params: string[] = [userId];

      let index: number = 1;

      if (status) {
        params.push(status);
        query += ` AND status = $${++index}`;
      }

      if (name) {
        params.push(`%${name}%`);
        query += ` AND name ILIKE $${++index}`;
      }

      return (await postgres.db.query(query, params)).rows;

    } else { // 3 -- Get all gadgets for the user

      return (await postgres.db.query("SELECT * FROM gadgets WHERE created_by = $1", [userId])).rows;

    }
  }




  public async changeStatus({ gadgetId, status, updateDecommission = false }: ChangeStatusDataType): Promise<GadgetDataType> {

    const deleteGadget: boolean = (status === "Decommissioned" && updateDecommission) ? true : false;

    const randomCodeString: string = deleteGadget ? ", '" + randomCodeGenerator() + "' as confirmation_code" : "";

    return (
      (await postgres.db.query(
        `UPDATE gadgets 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        ${deleteGadget ? " , decommission_at = CURRENT_TIMESTAMP " : ""} 
        WHERE id = $2 RETURNING *
        ${ deleteGadget ? randomCodeString : "" }`, [status, gadgetId]
      ))).rows[0];

  }


}

const gadgetModel = new GadgetModel();

export default gadgetModel;