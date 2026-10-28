import SvgIcon from "../components/SvgIcon";
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

    <div className="list-item" onClick={() => onNavigate("cardlist")}>
        <div className="li-icon blue"><SvgIcon.Board /></div>
        <div className="li-text"><div className="li-type">Boards</div><div className="li-name">Card List</div></div>
        <span className="chevron">›</span>
    </div>

    <div className="list-item" onClick={() => onNavigate("todolist")}>
        <div className="li-icon green"><SvgIcon.Todo2 /></div>
        <div className="li-text"><div className="li-type">Daily</div><div className="li-name">ToDo List</div></div>
        <span className="chevron">›</span>
    </div>

    <div className="list-item" onClick={() => onNavigate("acctbook")}>
        <div className="li-icon orange"><SvgIcon.AccountBook /></div>
        <div className="li-text"><div className="li-type">Ledger</div><div className="li-name">Account Book</div></div>
        <span className="chevron">›</span>
    </div>

    </div>
  )
}

export default Welcome