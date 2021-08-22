import { html } from 'poor-man-jsx';
import event from '../event';

const Contact = () => html`
  <h1 class="title title--centered">Message us</h1>
  <form
    class="form"
    ${{
      onChange: (e) => {
        event.emit(
          'form input',
          [...e.currentTarget.elements].some((el) => el.value)
        );
      },
      onSubmit: (e) => {
        e.preventDefault();
        alert('Thank you for your message');
        e.target.reset();
        event.emit('form input', false);
      },
    }}
  >
    <input
      class="form__input"
      type="text"
      name="name"
      id="name"
      placeholder="Your name"
      required
    />
    <input
      class="form__input"
      type="email"
      name="email"
      id="email"
      placeholder="Your email"
      required
    />
    <textarea
      class="form__textarea"
      name="message"
      id="message"
      cols="30"
      rows="15"
      placeholder="Your message"
      required
    ></textarea>
    <button class="form__submit" type="submit">Send</button>
  </form>
`;

export default Contact;
