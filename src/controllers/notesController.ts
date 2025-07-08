import { Request, Response } from 'express';
import Notes from '../models/notesModel';
import { Types } from "mongoose"
import jwt from "jsonwebtoken";
import { verifyTokenHelper } from '../auth';



//Create Notes Api
export const createNotes = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ").pop();
    if (!token) {
      throw new Error("token is missing")
    }
    const secretKey = process.env.JWT_SECRET as string;

    const decodedData = jwt.verify(token, secretKey) as { id: string };
    const { id } = decodedData
    const { title, description } = req.body;
    const user_id = new Types.ObjectId(id)
    const notes = new Notes({ title, description, user_id });
    await notes.save();
    res.status(201).json(notes);
  } catch (err: unknown) {
    let errorMessage = "Server error";

    if (err instanceof Error) {
      errorMessage = err.message;
    }

    res.status(500).json({
      message: errorMessage,
    });
  }
};


// Get all notes Api
export const getNotes = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.split(" ").pop();
    if (!token) {
      throw new Error("token is missing")
    }
    const secretKey = process.env.JWT_SECRET as string;

    const decodedData = jwt.verify(token, secretKey) as { id: string };
    const { id } = decodedData
    // filter by user_id
    const notes = await Notes.find({ user_id: id }) || [];
    res.status(200).json(notes);
  } catch (err: unknown) {
    let errorMessage = "Server error";

    if (err instanceof Error) {
      errorMessage = err.message;
    }

    res.status(500).json({
      message: errorMessage,
    });
  }
};


// Update Note Api
export const upNotes = async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const isVerified = await verifyTokenHelper(req, res)

  if (!isVerified) {
   return res.status(401).json({ message: " Auth Error - token is invalid" })
  }
  // const authHeader = req.headers.authorization || "";
  // const token = authHeader.split(" ").pop();
  // if (!token) {
  //   throw new Error("token is missing")
  // }
  // const secretKey = process.env.JWT_SECRET_KEY as string;

  // const decoded = jwt.verify(token, secretKey);
  const { title, description } = req.body;
  try {
    const updatedNote = await Notes.findByIdAndUpdate(
      id,
      { title, description },
      { new: true, runValidators: true }
    );
    console.log(updatedNote)
    return res.status(200).json(updatedNote);
  } catch (err: unknown) {
    return res.status(500).json({ message: 'Failed to update note', error: err });
  }
};






// Delete Note Api
export const deleteNote = async (req: Request, res: Response) : Promise<any> =>  {
  try {
    const isVerified = await verifyTokenHelper(req, res)

    if (!isVerified) {
      return res.status(401).json({ message: " Auth Error - token is invalid" })
    }
    const noteId = req.params.id;
    const deletedNote = await Notes.findByIdAndDelete(noteId);
    console.log(deletedNote)
    res.status(200).json({ message: `Note ${noteId} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update note', err });
  }
};



