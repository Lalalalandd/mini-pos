import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { CategoryModel } from './category.model';

@ObjectType()
export class ProductModel {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  sku: string;

  @Field({ nullable: true })
  barcode?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  costPrice: number;

  @Field(() => Int)
  stock: number;

  @Field(() => Int)
  minStockAlert: number;

  @Field(() => ID)
  categoryId: string;

  @Field(() => CategoryModel, { nullable: true })
  category?: CategoryModel;

  @Field()
  status: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  createdAt: string;
}
