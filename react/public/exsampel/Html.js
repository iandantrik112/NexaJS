import {
  useState,
  StyleSheet,
  Div,
  P,
  Span,
  HtmlButton,
  H1,
  H2,
  Section,
  Article,
  createHTMLElement,
} from "NexaUI";

// Example of creating a custom HTML-like element
const Card = createHTMLElement("div");
const List = createHTMLElement("ul");
const ListItem = createHTMLElement("li");

const HtmlExample = () => {
  const [count, setCount] = useState(0);

  return (
    <Div style={styles.container}>
      <Section style={styles.header}>
        <H1 style={styles.title}>Welcome to HTML-like Components</H1>
        <P style={styles.subtitle}>
          This is an example of using HTML-like syntax in React Native
        </P>
      </Section>

      <Article style={styles.content}>
        <H2 style={styles.sectionTitle}>Interactive Counter Example</H2>
        <Card style={styles.card}>
          <P style={styles.counterText}>
            Count: <Span style={styles.count}>{count}</Span>
          </P>
          <Div style={styles.buttonContainer}>
            <HtmlButton
              style={styles.button}
              onPress={() => setCount(count - 1)}
            >
              <P style={styles.buttonText}>Decrease</P>
            </HtmlButton>
            <HtmlButton
              style={styles.button}
              onPress={() => setCount(count + 1)}
            >
              <P style={styles.buttonText}>Increase</P>
            </HtmlButton>
          </Div>
        </Card>

        <H2 style={styles.sectionTitle}>Feature List</H2>
        <List style={styles.list}>
          <ListItem style={styles.listItem}>
            <P>✓ HTML-like syntax</P>
          </ListItem>
          <ListItem style={styles.listItem}>
            <P>✓ Familiar component names</P>
          </ListItem>
          <ListItem style={styles.listItem}>
            <P>✓ Custom components support</P>
          </ListItem>
          <ListItem style={styles.listItem}>
            <P>✓ Full React Native functionality</P>
          </ListItem>
        </List>
      </Article>
    </Div>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#444",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  counterText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 15,
  },
  count: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
});

export default HtmlExample;
