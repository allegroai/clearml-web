import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {EntitiesCacheService} from './entities-cache.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [],
  providers: [EntitiesCacheService]
})
export class CacheModule { }
