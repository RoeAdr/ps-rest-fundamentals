import express from "express";
import { getOrderDetail, getOrders } from "./orders.service";
import { validate } from "../../middleware/validation.middleware";
import { idUUIDRequestSchema, pagingRequestSchema } from "../types";

export const ordersRouter = express.Router();


// GET (all) with paging (take and skip)
/*
    call example: http://localhost:4000/api/orders?take=7&skip=1    
*/


ordersRouter.get("/", validate(pagingRequestSchema), async(req, res) => {
    const data = pagingRequestSchema.parse(req);
    const orders = await getOrders(data.query.skip, data.query.take);
    res.json(orders);
});

// Old Call Validation can be improved with Middleware
/*        
ordersRouter.get("/", async(req, res) => {
    const query = req.query;
    const take = query.take;
    const skip = query.skip;

    if (
        take
        && typeof take === "string"
        && parseInt(take) > 0
        && skip
        && typeof skip === "string"
        && parseInt(skip) > -1
    ) {
        const orders = await getOrders(parseInt(skip), parseInt(take));
        res.json(orders);
    } else {
        res.status(400).json({
            message:
                "Take and skip query parameters are required. " +
                "Take must be greater than 0 and skip must be greater than -1",
        });
    } 
  });
*/


// GET /{id}

ordersRouter.get("/:id", validate(idUUIDRequestSchema), async (req, res) => {
    const data = idUUIDRequestSchema.parse(req);
    const order = await getOrderDetail(data.params.id);
    if (order != null) {
        res.json(order);
    } else {
        res.status(404).json({message: "Order Not Found"});
    }
});


// Old call
/*
ordersRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    const order = await getOrderDetail(id);
    if (order != null){      
      res.json(order);
    } else {
      res.status(404).json({message:"Order Not Found"});
    }
  });
  */