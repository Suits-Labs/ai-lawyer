import { ChangeEventHandler, useState, forwardRef, useEffect } from "react";
import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { GenerateIndictmentBody } from "./api/generateIndictment";
import {
  Button,
  ButtonToolbar,
  Form,
  Input,
  Message,
  useToaster,
  Footer,
  Modal,
} from "rsuite";
import { PrependParameters } from "rsuite/esm/@types/utils";
import { TypeAttributes } from "rsuite/esm/@types/common";
import * as ackeeTracker from "ackee-tracker";
import EXAMPLE from "../../example";

const Textarea = forwardRef<HTMLTextAreaElement, any>((props, ref) => (
  <Input
    {...props}
    ref={ref}
    as="textarea"
    rows={5}
    className={styles.textarea}
  />
));

const SPONSORS_LIST = ["yinali***", "**华", "Z*d", "*泉", "阿*y", "*°", "Sun*"];

function Notices() {
  const [isOpen, setIsOpen] = useState(false);

  const openSponsorsList = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Message type={"info"}>
      {
        "大家好！我是袁先。很高兴这个项目能够帮助到大家。目前，AI 维权律师每天为大家生成 200+ 封起诉书，但是这也意味着耗费数十万的 tokens。"
      }

    </Message>
  );
}

export default function Home() {
  const [fact, setFact] = useState("");
  const [appeal, setAppeal] = useState("");
  const [indictment, setIndictment] = useState("");
  const [loading, setLoading] = useState(false);
  const toaster = useToaster();
  const [ackeeServer, setAckeeServer] = useState("");
  const [ACKEE, setACKEE] = useState<ackeeTracker.AckeeInstance>();

  function Example() {
    return (
      <div className={styles.example}>
        <div className={styles["example-label"]}>例：</div>
        <div className={styles["example-container"]}>
          {EXAMPLE.map(({ type, fact, appeal }) => (
            <Button
              size="xs"
              key={type}
              onClick={() => setExample(fact, appeal)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (location.hostname === "ai-lawyer.yuanx.me") {
      const ackeeServer = "https://ackee.yuanx.me";
      setAckeeServer(ackeeServer);
      setACKEE(
        ackeeTracker.create(ackeeServer, {
          detailed: true,
          ignoreLocalhost: false,
        })
      );
    }
  }, []);

  const MyMessage = (content: string, type: TypeAttributes.Status) => {
    return (
      <Message showIcon type={type}>
        {content}
      </Message>
    );
  };

  const generateIndictment = async () => {
    ACKEE?.action("eb09d303-db45-40db-aefd-1183d951b2c0", {
      key: "Click",
      value: 1,
    });
    setLoading(true);
    if (!fact || !appeal) {
      toaster.push(MyMessage("请输入‘事实经过’和‘诉求’！", "warning"), {
        placement: "topCenter",
        duration: 2000,
      });
      setLoading(false);
      return;
    }

    setIndictment("");
    const body: GenerateIndictmentBody = {
      fact: fact,
      appeal: appeal,
    };
    const res = await fetch("/api/generateIndictment", {
      method: "post",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    let error = "";
    if (res.ok) {
      try {
        const data = res.body;
        if (!data) return;
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let chunkValues = "";
        while (true) {
          const { value, done } = await reader.read();
          const chunkValue = decoder.decode(value);
          chunkValues += chunkValue;
          setIndictment(chunkValues);
          if (done) break;
        }
      } catch (err) {
        error = "生成失败，请重试！";
      }
    } else {
      error = "生成失败，请重试！";
    }
    toaster.push(
      MyMessage(error || "生成完成，祝好", error ? "error" : "success"),
      {
        placement: "topCenter",
        duration: 2000,
      }
    );
    setLoading(false);
  };

  const cleanForm = () => {
    setFact("");
    setAppeal("");
  };

  const factChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setFact(value);
  };

  const appealChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setAppeal(value);
  };

  const setExample = (fact: string, appeal: string) => {
    setFact(fact);
    setAppeal(appeal);
  };

  const indictmentChange: PrependParameters<
    ChangeEventHandler<HTMLInputElement>,
    [value: string]
  > = (value, e) => {
    setIndictment(value);
  };

  return (
    <>
      <Head>
        <title>AI 维权律师 BNB</title>
        <meta name="description" content="AI 维权律师 BNB" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {ackeeServer && (
          <script
            async
            src={`${ackeeServer}/tracker.js`}
            data-ackee-server={ackeeServer}
            data-ackee-domain-id="7cff383e-2fdf-4191-94c1-58f4a0c2d7d7"
            data-ackee-opts='{ "detailed": true, "ignoreLocalhost": false }'
          ></script>
        )}
      </Head>
      <main className={styles.main}>
        <div className={styles.config}>
          <h1 className={styles.title}>AI 维权律师 BNB</h1>
          <Notices />
          <Form fluid className={styles.form}>
            <Form.Group controlId="textarea">
              <Form.ControlLabel>事实经过：</Form.ControlLabel>
              <Form.Control
                name="textarea"
                accepter={Textarea}
                value={fact}
                placeholder={`例：${EXAMPLE[0].fact}`}
                onChange={factChange}
              />
            </Form.Group>
            <Form.Group controlId="textarea">
              <Form.ControlLabel>诉求：</Form.ControlLabel>
              <Form.Control
                name="textarea"
                accepter={Textarea}
                value={appeal}
                placeholder={`例：${EXAMPLE[0].appeal}`}
                onChange={appealChange}
              />
            </Form.Group>
            <Form.Group>
              <Example />
            </Form.Group>
            <Form.Group>
              <ButtonToolbar>
                <Button
                  loading={loading}
                  appearance="primary"
                  onClick={generateIndictment}
                >
                  生成起诉书
                </Button>
                <Button appearance="default" onClick={cleanForm}>
                  清除数据
                </Button>
              </ButtonToolbar>
            </Form.Group>
            <Form.Group>
              <div className={styles.tips}>
                {
                  "小提示：尽量不要使用个人真实信息，可以使用 “x 先生 / 女士” 等方式代替"
                }
              </div>
            </Form.Group>
          </Form>
        </div>
        <div className={styles.output}>
          <Input
            as="textarea"
            placeholder="等待生成起诉书..."
            value={indictment}
            onChange={indictmentChange}
          />
        </div>
        <Footer className={styles.footer}>
          {"yuanx @ "}
          <a href="https://github.com/Suits-Labs/ai-lawyer" target="_blank">
            GitHub
          </a>
          {" | "}
          <a href="https://x.com/AILawyerBNB" target="_blank">
            Twitter
          </a>
        </Footer>
      </main>
    </>
  );
}
