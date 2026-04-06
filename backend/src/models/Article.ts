import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type ArticleSource = 'manual' | 'generated';
export type ArticleStatus = 'draft' | 'published';

export interface ArticleAttributes {
  id: number;
  title: string;
  content: string;
  summary?: string;
  coverImageUrl?: string;
  coverImageKey?: string;
  source: ArticleSource;
  status: ArticleStatus;
  externalSourceUrl?: string;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ArticleCreationAttributes = Optional<ArticleAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public summary?: string;
  public coverImageUrl?: string;
  public coverImageKey?: string;
  public source!: ArticleSource;
  public status!: ArticleStatus;
  public externalSourceUrl?: string;
  public publishedAt?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { notEmpty: true, len: [1, 500] },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    summary: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    coverImageUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    coverImageKey: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('manual', 'generated'),
      allowNull: false,
      defaultValue: 'manual',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      allowNull: false,
      defaultValue: 'published',
    },
    externalSourceUrl: {
      type: DataTypes.STRING(2048),
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'articles',
    timestamps: true,
  }
);
