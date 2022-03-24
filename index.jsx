import { Fragment, useState, useEffect } from 'react';
// ** Store & Actions
import { useSelector } from 'react-redux';
import Centrifuge from 'centrifuge';
import CardServer from './cardServer';
import { Row, Col } from 'reactstrap';
import { useParams } from 'react-router-dom';
import Breadcrumbs from '@components/breadcrumbs';

const UnionList = () => {
  const store = useSelector(state => state.union);
  const [baseList, setBaseList] = useState([]);
  const [srvCtr, setSrvCtr] = useState(null);
  const [sub, setSub] = useState(null);
  const { Queue } = useParams();
  const queueName = Queue.split(':')[1];
  const channel = queueName;
  const centrifuge = new Centrifuge("ws://xxx:8081/connection/websocket");
  centrifuge.setToken("xxx");
  // 初始化列表
  useEffect(() => {
    centrifuge.connect();
    return () => {
      sub && sub.unsubscribe();
      centrifuge.disconnect();
    };
  }, []);

  useEffect(() => {
    setBaseList(store.srvBase);
  }, [store]);

  // 监听channel获取推送信息
  useEffect(() => {
    const unSub = centrifuge.subscribe(channel, (message) => {
      /**
        * @message msg_type:
          "srv"  // 服务状态
        */
      const msg = message.data;
      setSub(unSub);
      if (msg.msg_type === 'srv') {
        setSrvCtr(msg);
      }
    });
  }, []);
  // 处理srv在线状态返回信息
  useEffect(() => {
    let isUnmount = false;
    const base = [...baseList];
    for (let i = 0; i < baseList.length; i++) {
      if (srvCtr['server_name'].indexOf(baseList[i]['ServiceName']) !== -1) {
        base[i]['StatusTag'] = srvCtr.server_status;
        setBaseList(base);
      }
    };
    return () => isUnmount = true;
  }, [srvCtr]);

  return (
    <Fragment>
      <Breadcrumbs breadCrumbTitle='联调状态' breadCrumbActive='机器列表' />
      <Row>
        <Col sm='12'>
          <CardServer
            baseList={dataToRender(baseList)}
          />
        </Col>
      </Row>
    </Fragment>
  );
};
export default UnionList;
