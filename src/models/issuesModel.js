/**
 * @file This file defines the IssuesModel class.
 * @module IssuesModel
 * @author Beatriz Sanssi <bs222eh@student.lnu.se>
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

// create a schema
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 1
  },
  author: {
    type: String,
    ref: 'Id',
    required: true
  },
  avatar: {
    type: String,
    required: false
  },
  projectId: {
    type: Number,
    required: true
  },
  iid: {
    type: Number,
    required: true
  },
  state_event: {
    type: String,
    required: true,
    default: 'open'
  },
  done: {
    type: Boolean,
    required: false,
    default: false
  }
}, {
  timestamps: true,
  toObject: {
    virtuals: true, // ensure virtual fields are serialized
    // eslint-disable-next-line jsdoc/require-jsdoc
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    }
  }
})
schema.virtual('id').get(function () {
  return this._id.toHexString()
})

schema.add(BASE_SCHEMA)
export default mongoose.model('Issue', schema)
