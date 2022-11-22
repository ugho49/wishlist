import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WishlistController } from './wishlist.controller';
import { WishlistEntity } from './wishlist.entity';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([WishlistEntity])],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
