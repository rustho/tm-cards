import { Model, Document, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';

export class DatabaseService<T extends Document> {
  constructor(protected model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error: any) {
      throw new Error(`Create operation failed: ${error.message}`);
    }
  }

  async findById(id: string, populate?: string[]): Promise<T | null> {
    try {
      let query = this.model.findById(id);
      if (populate) {
        populate.forEach(field => query = query.populate(field));
      }
      return await query.exec();
    } catch (error: any) {
      throw new Error(`FindById operation failed: ${error.message}`);
    }
  }

  async findOne(filter: FilterQuery<T>, populate?: string[]): Promise<T | null> {
    try {
      let query = this.model.findOne(filter);
      if (populate) {
        populate.forEach(field => query = query.populate(field));
      }
      return await query.exec();
    } catch (error: any) {
      throw new Error(`FindOne operation failed: ${error.message}`);
    }
  }

  async find(
    filter: FilterQuery<T> = {}, 
    options: QueryOptions = {},
    populate?: string[]
  ): Promise<T[]> {
    try {
      let query = this.model.find(filter, null, options);
      if (populate) {
        populate.forEach(field => query = query.populate(field));
      }
      return await query.exec();
    } catch (error: any) {
      throw new Error(`Find operation failed: ${error.message}`);
    }
  }

  async updateById(id: string, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findByIdAndUpdate(
        id, 
        { ...update, updatedAt: new Date() }, 
        { new: true, runValidators: true }
      ).exec();
    } catch (error: any) {
      throw new Error(`UpdateById operation failed: ${error.message}`);
    }
  }

  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    try {
      return await this.model.findOneAndUpdate(
        filter,
        { ...update, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
    } catch (error: any) {
      throw new Error(`UpdateOne operation failed: ${error.message}`);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error: any) {
      throw new Error(`DeleteById operation failed: ${error.message}`);
    }
  }

  async deleteMany(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      const result = await this.model.deleteMany(filter).exec();
      return result.deletedCount || 0;
    } catch (error: any) {
      throw new Error(`DeleteMany operation failed: ${error.message}`);
    }
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    try {
      return await this.model.countDocuments(filter).exec();
    } catch (error: any) {
      throw new Error(`Count operation failed: ${error.message}`);
    }
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    try {
      const result = await this.model.findOne(filter).select('_id').lean().exec();
      return !!result;
    } catch (error: any) {
      throw new Error(`Exists operation failed: ${error.message}`);
    }
  }

  async aggregate(pipeline: any[]): Promise<any[]> {
    try {
      return await this.model.aggregate(pipeline).exec();
    } catch (error: any) {
      throw new Error(`Aggregation operation failed: ${error.message}`);
    }
  }
} 