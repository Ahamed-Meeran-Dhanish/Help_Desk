import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        trim: true,
        maxlength: [100, 'Subject cannot be more than 100 characters'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description'],
    },
    status: {
        type: String,
        enum: ['Open', 'In Progress', 'Waiting for Customer', 'Resolved', 'Closed'],
        default: 'Open',
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
    },
    type: {
        type: String,
        enum: ['Incident', 'Service Request'],
        default: 'Incident'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // We will add attachment support later in Module 4
    attachments: [{
        type: String, // URLs to files
    }],
}, {
    timestamps: true,
});

export default mongoose.model('Ticket', ticketSchema);
