import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INote extends Document {
  title: string;
  description: string;
  user_id: Types.ObjectId; // Reference to User
}

const noteSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Foreign key
});

const Notes = mongoose.model<INote>('Note', noteSchema);
export default Notes;
