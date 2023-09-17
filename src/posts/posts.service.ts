import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepository: Repository<Post>,
  ) {}
  async create(createPostDto: CreatePostDto) {
    const newPost = this.postsRepository.create(createPostDto);
    await this.postsRepository.save(newPost);
    return newPost;
  }

  findAll() {
    return this.postsRepository.find();
  }

  async findOne(id: string) {
    const post = await this.postsRepository.findOne({ where: { id } });
    if (!post) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    await this.postsRepository.update(id, updatePostDto);
    const updated = await this.postsRepository.findOne({ where: { id } });
    if (!updated) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  async remove(id: string) {
    const deletedResponse = await this.postsRepository.delete(id);
    if (!deletedResponse.affected) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return deletedResponse;
  }
}
