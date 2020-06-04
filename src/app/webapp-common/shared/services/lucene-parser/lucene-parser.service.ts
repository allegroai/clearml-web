import { Injectable } from '@angular/core';
import * as lucene from 'lucene';
import {ILuceneField, ILuceneNode, IMPLICIT, OPERATORS} from './lucene-parser.model';


@Injectable({
  providedIn: 'root'
})
export class LuceneParserService {

  constructor() { }

  isValid(query: string): boolean {
    if (!this.isLuceneValidLightTest(query)) return false;
    try {
      const ast = lucene.parse(query);
      return this.isLuceneValidRec(ast);
    } catch (e) {
      return false;
    }
  }

  private isLuceneValidLightTest(query: string) {
    // is string
    if (typeof query !== 'string') return false;
    // last char cannot be operator...
    const chars = query.trim().split(' ');
    const lastChar = chars[chars.length - 1];
    return !OPERATORS.includes(lastChar);
  }

  private isLuceneValidRec(node: ILuceneField | ILuceneNode): boolean {
    // if the prev node had no child node...
    if (!node) return true;
    if (this.isFieldNode(node)) {
      const luceneNode = <ILuceneNode> node;
      if (luceneNode.left && luceneNode.operator && !luceneNode.right) return false;

      return this.isLuceneValidRec(luceneNode.left) && this.isLuceneValidRec(luceneNode.right) && this.isOperatorValid(luceneNode.operator);
    }
    return this.isLuceneFieldValid(node as ILuceneField);
  }

  private isFieldNode(node: ILuceneField | ILuceneNode): boolean {
    return node.hasOwnProperty('left');
  }

  private isLuceneFieldValid(field: ILuceneField): boolean {
    return !!(field.field && field.term && ![field.field, field.term].includes(IMPLICIT));
  }

  private isOperatorValid(operator: string): boolean {
    return operator !== IMPLICIT;
  }

}
