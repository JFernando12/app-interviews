// Test example showing the enhanced markdown support

const testMarkdown = `
**Lists:**
- Mutable (can be modified after creation)
- Use square brackets []
- Support item assignment, append, remove operations
- Slightly slower due to mutability overhead

**Tuples:**
- Immutable (cannot be modified after creation)
- Use parentheses ()
- Cannot change elements after creation
- Faster and more memory efficient
- Can be used as dictionary keys (hashable)

You can also use **inline code** like \`my_list.append()\` within text.

\`\`\`python
# Example code block
my_list = [1, 2, 3]
my_tuple = (1, 2, 3)
\`\`\`

More **bold text** and regular text mixed together.
`;

export default testMarkdown;