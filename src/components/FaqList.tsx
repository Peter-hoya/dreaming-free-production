export function FaqList({ items }: { items: ReadonlyArray<readonly [string, string]> | Array<{ question: string; answer: string }> }) {
  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const question = "question" in item ? item.question : item[0];
        const answer = "answer" in item ? item.answer : item[1];
        return (
          <details className="faq-item" key={`${question}-${index}`}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        );
      })}
    </div>
  );
}
