import { html } from 'poor-man-jsx';
import Card from './Card';

const Category = ({ params }) => {
  const length = 5;
  const lowerLimit = params.id * length - length + 1;

  return html`
    ${new Array(length).fill().map((_, i) => Card(lowerLimit + i))}
  `;
};

export default Category;
