import { expect, test } from 'vitest';
import { firstNonEmpty, htmlToText } from '../shared/utils/text';

test.each([
	[['a', 'b'], 'a'],
	[['', 'b'], 'b'],
	[[null, undefined, 0, false, {}, 'c'], 'c'],
	[[], undefined],
	[['', null], undefined],
])('firstNonEmpty(%j) = %j', (values, expected) => {
	expect(firstNonEmpty(...values)).toBe(expected);
});

test.each([
	['plain', 'plain'],
	['<p>a<b>b</b></p><br/>c', 'abc'],
	['a &amp; b &lt;i&gt; &quot;c&quot; &#39;d&#x27;', 'a & b <i> "c" \'d\''],
	['a&nbsp;b', 'a\u00a0b'],
	['&unknown; &#0; &#x110000;', '&unknown; &#0; &#x110000;'],
	['&lt;script&gt;', '<script>'],
])('htmlToText(%j) = %j', (html, expected) => {
	expect(htmlToText(html)).toBe(expected);
});
