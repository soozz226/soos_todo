import Ico from "../etc/icons";

import profileImg from "../assets/profile.png";

function Welcome({ onNavigate, onUser }) {

  return (

    <div className="welcome-screen">
    <div className="back-row"> ToDo-Task </div>
    <div className="workspace-row">
        <div className="ws-icon"><img src={profileImg} alt="profile" className="ws-icon-img" /></div>
        <div>
        <div className="ws-name">{onUser} </div>
        <div className="ws-meta">1 members · Private</div>
        </div>
    </div>
    <div className="sec">
        <div className="sec-title">Boards</div>
        <div className="list-item" onClick={() => onNavigate("cardlist")}>
        <div className="li-icon"><Ico.Board /></div>
        <div className="li-text"><div className="li-name">Card List</div></div>
        <span className="chevron">›</span>
        </div>
    </div>
    <div className="sec">
        <div className="sec-title">Daily</div>
        <div className="list-item" onClick={() => onNavigate("todolist")}>
        <div className="li-icon"><Ico.Todo2 /></div>
        <div className="li-text"><div className="li-name">ToDo List</div><div className="li-type"></div></div>
        <span className="chevron">›</span>
        </div>
    </div>

    <div className="sec">
        <div className="sec-title">Ledger</div>
        <div className="list-item" onClick={() => onNavigate("acctbook")}>
        <div className="li-icon"><Ico.AccountBook /></div>
        <div className="li-text"><div className="li-name">Account Book</div><div className="li-type"></div></div>
        <span className="chevron">›</span>
        </div>
    </div>

    </div>
  )
}

export default Welcome
