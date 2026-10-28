import { supabase } from "../lib/supabaseClient";

// 가계부 항목 조회 (월 범위)
export async function fetchAcctEntries(year, month, book) {
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

    let query = supabase
        .from("soos_acct")
        .select("*")
        .gte("acct_date", start)
        .lte("acct_date", end);
    if (book) query = query.eq("acct_book", book);

    const { data, error } = await query.order("acct_date", { ascending: true });
    if (error) throw error;
    return data;
}

// 달력 그리드용: 시작일~종료일 범위 조회 (이전/다음 달 칸 포함)
export async function fetchAcctEntriesRange(start, end, book) {
    let query = supabase
        .from("soos_acct")
        .select("*")
        .gte("acct_date", start)
        .lte("acct_date", end);
    if (book) query = query.eq("acct_book", book);

    const { data, error } = await query.order("acct_date", { ascending: true });
    if (error) throw error;
    return data;
}

// 이 카드(todo)와 연동된 가계부 내역
export async function fetchAcctEntriesByTodo(todoUuid) {
    const { data, error } = await supabase
        .from("soos_acct")
        .select("acct_uuid, acct_book, acct_date, acct_amnt, acct_iofl")
        .eq("acct_todo", todoUuid);
    if (error) throw error;
    return data;
}

export async function insertAcctEntry(entry) {
    const { data, error } = await supabase.from("soos_acct").insert(entry).select().single();
    if (error) throw error;
    return data;
}

export async function updateAcctEntry(uuid, patch) {
    const { data, error } = await supabase
        .from("soos_acct")
        .update({ ...patch, acct_updt: new Date().toISOString() })
        .eq("acct_uuid", uuid)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteAcctEntry(uuid) {
    const { error } = await supabase.from("soos_acct").delete().eq("acct_uuid", uuid);
    if (error) throw error;
}

// 코드 테이블 (todoApi.js의 fetchToDoStatusCodes 패턴과 동일)
export async function fetchAcctBookCodes() {
    const { data, error } = await supabase.from("acct_code").select("*").eq("code_flag", "Z").order("code_ordr");
    if (error) throw error;
    return data;
}

export async function fetchAcctIoCodes() {
    const { data, error } = await supabase.from("acct_code").select("*").eq("code_flag", "A").order("code_ordr");
    if (error) throw error;
    return data;
}

export async function fetchAcctCodes() {
    const { data, error } = await supabase
        .from("acct_code")
        .select("*")
        .in("code_flag", ["B", "C", "D"])
        .order("code_ordr");
    if (error) throw error;
    return data;
}

// 여러 내역의 날짜를 한 번에 변경 (일괄전송)
export async function moveAcctEntries(uuids, newDate) {
    const { error } = await supabase
        .from("soos_acct")
        .update({ acct_date: newDate, acct_updt: new Date().toISOString() })
        .in("acct_uuid", uuids);
    if (error) throw error;
}

export async function fetchAcctCarryBase(book, year, month) {
    const first = `${year}-${String(month + 1).padStart(2, "0")}-01`;
 
    let lastQ = supabase
        .from("soos_acct")
        .select("acct_date, acct_amnt")
        .eq("acct_carry", true)
        .lt("acct_date", first)
        .order("acct_date", { ascending: false })
        .limit(1);
    if (book) lastQ = lastQ.eq("acct_book", book);
    const { data: last, error: lastErr } = await lastQ;
    if (lastErr) throw lastErr;
 
    const base = last?.[0]?.acct_amnt ?? 0;
    const from = last?.[0]?.acct_date ?? null;
 
    // 1000건 제한이 있어서 나눠서 가져옴
    const PAGE = 1000;
    let net = 0;
    for (let start = 0; ; start += PAGE) {
        let q = supabase
            .from("soos_acct")
            .select("acct_iofl, acct_amnt")
            .eq("acct_carry", false)
            .lt("acct_date", first)
            .order("acct_uuid")
            .range(start, start + PAGE - 1);
        if (book) q = q.eq("acct_book", book);
        if (from) q = q.gte("acct_date", from);
        const { data, error } = await q;
        if (error) throw error;
        for (const e of data) net += e.acct_iofl === "A001" ? e.acct_amnt : -e.acct_amnt;
        if (data.length < PAGE) break;
    }
    return base + net;
}
 

export async function insertAcctPhrase({ name, ordr, book }) {
    const { data, error } = await supabase
        .from("acct_code")
        .insert({ code_flag: "D", code_cdnm: name, code_ordr: ordr, code_root: book ? [book] : null })
        .select()
        .single();
    if (error) throw error;
    return data;
}
 
// 문구 삭제
export async function deleteAcctPhrase(cdid) {
    const { error } = await supabase
        .from("acct_code")
        .delete()
        .eq("code_flag", "D")
        .eq("code_cdid", cdid);
    if (error) throw error;
}

export async function insertAcctBook({ name, ordr, color }) {
    const { data, error } = await supabase
        .from("acct_code")
        .insert({ code_flag: "Z", code_cdnm: name, code_ordr: ordr, code_color: color }) // code_cdid 는 DB가 자동 생성
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteAcctBook(cdid) {
    const { data, error } = await supabase
        .from("acct_code")
        .delete()
        .eq("code_flag", "Z")
        .eq("code_cdid", cdid)
        .select();
    if (error) throw error;
    if (!data || data.length === 0) throw new Error("삭제된 행이 없습니다 (RLS 정책 또는 id 확인 필요)");
}

// 해당 가계부에 내역이 몇 건 있는지 (있으면 삭제 막기 위해)
export async function countAcctEntriesByBook(book) {
    const { count, error } = await supabase
        .from("soos_acct")
        .select("acct_uuid", { count: "exact", head: true })
        .eq("acct_book", book);
    if (error) throw error;
    return count ?? 0;
}

// ─────────────────────────────────────────────
// acctApi.js 맨 아래에 추가 (상세 항목 추가/삭제)
// ─────────────────────────────────────────────


// 항목 추가
export async function insertAcctType({ flag, name, ordr, book, icon }) {
    const { data, error } = await supabase
        .from("acct_code")
        .insert({
            code_flag: flag, code_cdnm: name, code_ordr: ordr,
            code_root: book ? [book] : null,
            code_icon: icon || null,
        })
        .select()
        .single();
    if (error) throw error;
    return data;
}
// 항목 삭제
export async function deleteAcctType(flag, cdid) {
    const { error } = await supabase
        .from("acct_code")
        .delete()
        .eq("code_flag", flag)
        .eq("code_cdid", cdid);
    if (error) throw error;
}

export async function updateAcctType(flag, cdid, patch) {
    const { data, error } = await supabase
        .from("acct_code")
        .update(patch)
        .eq("code_flag", flag)
        .eq("code_cdid", cdid)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// 이 항목으로 저장된 내역이 몇 건인지 (있으면 삭제 막기 위해)
export async function countAcctEntriesByType(cdid) {
    const { count, error } = await supabase
        .from("soos_acct")
        .select("acct_uuid", { count: "exact", head: true })
        .eq("acct_type", cdid);
    if (error) throw error;
    return count ?? 0;
}

