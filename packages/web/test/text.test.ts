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
	['<p>a<b>b</b></p><br/>c', 'ab\n\nc'],
	['a<br>b<BR />c', 'a\nb\nc'],
	['<ul><li>a</li><li>b</li></ul><h1>c</h1><div>d</div>', 'a\nb\nc\nd'],
	['a &amp; b &lt;i&gt; &quot;c&quot; &#39;d&#x27;', 'a & b <i> "c" \'d\''],
	['a&nbsp;b', 'a\u00a0b'],
	['caf&eacute;', 'café'],
	['&unknown; &#0; &#x110000;', '&unknown; \ufffd \ufffd'],
	['&lt;script&gt;', '<script>'],
	['&lt;br&gt;', '<br>'],
	['a <b', 'a <b'],
])('htmlToText(%j) = %j', (html, expected) => {
	expect(htmlToText(html)).toBe(expected);
});
