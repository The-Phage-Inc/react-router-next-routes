import { normalizeSlashes } from '../src/utils/normalizeSlashes';

describe('normalizeSlashes', () => {
  it('Windowsのバックスラッシュをフォワードスラッシュに変換する', () => {
    expect(normalizeSlashes('foo\\bar\\baz')).toBe('foo/bar/baz');
  });

  it('フォワードスラッシュはそのまま保持する', () => {
    expect(normalizeSlashes('foo/bar/baz')).toBe('foo/bar/baz');
  });

  it('混在したスラッシュを正規化する', () => {
    expect(normalizeSlashes('foo\\bar/baz\\qux')).toBe('foo/bar/baz/qux');
  });

  it('空文字列を処理できる', () => {
    expect(normalizeSlashes('')).toBe('');
  });

  it('Windows形式の絶対パスを変換する', () => {
    expect(normalizeSlashes('C:\\Users\\app\\routes')).toBe(
      'C:/Users/app/routes',
    );
  });

  it('スラッシュを含まないパスはそのまま返す', () => {
    expect(normalizeSlashes('filename.ts')).toBe('filename.ts');
  });
});
