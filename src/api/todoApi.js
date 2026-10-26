import { supabase } from "../lib/supabaseClient";
import { fmtDate } from "../utils/dateUtils";

/* ────────────────── 코드 테이블 조회 ──────────────────
  ⚠️ code_flag 값('STATUS','T','S' 등)은 실제 DB에 저장된 값과
  반드시 다시 한번 대조해서 맞춰주세요. 대화 중 값이 여러 번
  바뀌었어서 실제 값 기준으로 확정이 필요합니다.
------------------------------------------------------- */

export async function fetchToDoStatusCodes() {
  const { data, error } = await supabase
    .from("todo_code")
    .select("*")
    .eq("code_flag", "A") // STATUS
    .order("code_cdid", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchToDoTagCodes() {
  const { data, error } = await supabase
    .from("todo_code")
    .select("*")
    .eq("code_flag", "T") // TAG (대분류)
    .order("code_cdid", { ascending: true });

  if (error) throw error;
  return data;
}

export async function fetchToDoSubCodes() {
  const { data, error } = await supabase
    .from("todo_code")
    .select("*")
    .eq("code_flag", "S") // SUB (소분류)
    .order("code_cdid", { ascending: true });

  if (error) throw error;
  return data;
}

/* ────────────────── 카드 목록 (CardList용, 가벼운 조회) ────────────────── */

export async function fetchToDoCards() {
  const [cardsRes, tagsRes, subsRes] = await Promise.all([
    supabase
      .from("soos_todo")
      .select(`
        todo_uuid, todo_name, todo_stat, todo_tags, todo_subs, todo_rgdt,
        todo_chck (
          chck_uuid,
          todo_chck_item ( item_uuid, item_done )
        )
      `)
      .order("todo_rgdt", { ascending: false }),
    supabase.from("todo_code").select("*").eq("code_flag", "T"),
    supabase.from("todo_code").select("*").eq("code_flag", "S"),
  ]);

  const { data: cards, error } = cardsRes;
  if (error) throw error;
  const tags = tagsRes.data;
  const subs = subsRes.data;

  return cards.map((c) => {
    const tagInfo = tags?.find((t) => t.code_cdid === c.todo_tags);
    const subInfo = subs?.find((s) => s.code_cdid === c.todo_subs);

    const allItems = (c.todo_chck || []).flatMap((chck) => chck.todo_chck_item || []);
    const chckTotal = allItems.length;
    const chckDone = allItems.filter((item) => item.item_done).length;

    return {
      ...c,
      todo_tagnm: tagInfo?.code_cdnm,
      todo_tagbg: tagInfo?.code_bgcl,
      todo_tagfg: tagInfo?.code_fgcl,
      todo_subnm: subInfo?.code_cdnm,
      todo_chckt: chckTotal,
      todo_chckd: chckDone,
    };
  });
}

// 체크리스트 항목을 날짜 빠른 순으로 정렬 (날짜 없는 항목은 맨 아래, 같은 날짜끼리는 기존 순서 유지)
const sortChckItems = (items = []) =>
  [...items].sort((a, b) => {
    if (!a.item_date && !b.item_date) return 0;
    if (!a.item_date) return 1;
    if (!b.item_date) return -1;
    return a.item_date < b.item_date ? -1 : a.item_date > b.item_date ? 1 : 0;
  });
/* ────────────────── 카드 상세 (CardDetail용, 전체 조회) ────────────────── */

export async function fetchToDoCardDetail(todoUuid) {
  const { data, error } = await supabase
    .from("soos_todo")
    .select(`
      *,
      todo_file(*),
      todo_chck(*, todo_chck_item(*))
    `)
    .eq("todo_uuid", todoUuid)
    .single();

  if (error) throw error;

  const { data: tags } = await supabase.from("todo_code").select("*").eq("code_flag", "T");
  const { data: subs } = await supabase.from("todo_code").select("*").eq("code_flag", "S");

  const tagInfo = tags?.find((t) => t.code_cdid === data.todo_tags);
  const subInfo = subs?.find((s) => s.code_cdid === data.todo_subs);

  return {
    ...data,
    todo_chck: (data.todo_chck || []).map((g) => ({
      ...g,
      todo_chck_item: sortChckItems(g.todo_chck_item),
    })),
    todo_tagnm: tagInfo?.code_cdnm,
    todo_tagbg: tagInfo?.code_bgcl,
    todo_tagfg: tagInfo?.code_fgcl,
    todo_subnm: subInfo?.code_cdnm,
  };
}

/* ────────────────── 카드 생성 / 수정 ────────────────── */

export async function createTodo(todo) {
  const { data, error } = await supabase
    .from("soos_todo")
    .insert([todo])
    .select();

  if (error) throw error;
  return data[0];
}

export async function updateTodo(todoUuid, patch) {
  const { data, error } = await supabase
    .from("soos_todo")
    .update({ ...patch, todo_updt: new Date().toISOString() })
    .eq("todo_uuid", todoUuid)
    .select();

  if (error) throw error;
  return data[0];
}

export async function deleteTodo(todoUuid) {
  const { error } = await supabase
    .from("soos_todo")
    .delete()
    .eq("todo_uuid", todoUuid);

  if (error) throw error;
}

export async function saveTodoFile(todoUuid, localFileBlocks = [], originalFileBlocks = []) {
  const originalIds = originalFileBlocks.map((b) => b.file_uuid);
  const localIds = localFileBlocks.map((b) => b.file_uuid);

  const deletedIds = originalIds.filter((id) => !localIds.includes(id));
  if (deletedIds.length > 0) {
    const { error } = await supabase.from("todo_file").delete().in("file_uuid", deletedIds);
    if (error) throw error;
  }

  const newBlocks = localFileBlocks.filter((b) => !originalIds.includes(b.file_uuid));
  if (newBlocks.length > 0) {
    const { error } = await supabase.from("todo_file").insert(
      newBlocks.map((b) => ({
        file_uuid: b.file_uuid,
        todo_uuid: todoUuid,
        file_kind: b.file_kind || "content",
        file_type: b.file_type,
        file_cont: b.file_cont,
        file_name: b.file_name,
        file_size: b.file_size ?? null,
        file_clpd: b.file_clpd,
        file_upld: b.file_upld ?? false,
        file_path: b.file_path ?? null,
      }))
    );
    if (error) throw error;
  }

  const updatedBlocks = localFileBlocks.filter((b) => originalIds.includes(b.file_uuid));
  for (const b of updatedBlocks) {
    const { error } = await supabase
      .from("todo_file")
      .update({
        file_kind: b.file_kind || "content",
        file_type: b.file_type,
        file_cont: b.file_cont,
        file_name: b.file_name,
        file_size: b.file_size ?? null,
        file_clpd: b.file_clpd,
        file_path: b.file_path ?? null,
        file_updt: new Date().toISOString(),
      })
      .eq("file_uuid", b.file_uuid);
    if (error) throw error;
  }
}

export async function uploadTodoFile(file, path) {
  const { error } = await supabase.storage
    .from("todo_file")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from("todo_file").getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteTodoFile(path) {
  if (!path) return;
  const { error } = await supabase.storage.from("todo_file").remove([path]);
  if (error) throw error;
}

/* ────────────────── 체크리스트 저장 (todo_chck, todo_chck_item) ────────────────── */

export async function saveTodoChck(todoUuid, localGroups = [], originalGroups = []) {
  const originalGroupIds = originalGroups.map((g) => g.chck_uuid);
  const localGroupIds = localGroups.map((g) => g.chck_uuid);

  // 1. 삭제된 그룹 (하위 아이템 먼저 삭제 후 그룹 삭제)
  const deletedGroupIds = originalGroupIds.filter((id) => !localGroupIds.includes(id));
  if (deletedGroupIds.length > 0) {
    const { error: itemDelErr } = await supabase
      .from("todo_chck_item")
      .delete()
      .in("chck_uuid", deletedGroupIds);
    if (itemDelErr) throw itemDelErr;

    const { error: groupDelErr } = await supabase
      .from("todo_chck")
      .delete()
      .in("chck_uuid", deletedGroupIds);
    if (groupDelErr) throw groupDelErr;
  }

  // 2. 새로 추가된 그룹
  const newGroups = localGroups.filter((g) => !originalGroupIds.includes(g.chck_uuid));
  if (newGroups.length > 0) {
    const { error } = await supabase.from("todo_chck").insert(
      newGroups.map((g) => ({
        chck_uuid: g.chck_uuid,
        todo_uuid: todoUuid,
        chck_name: g.chck_name,
        chck_clpd: g.chck_clpd,
      }))
    );
    if (error) throw error;
  }

  // 3. 수정된 그룹 (이름 / 접힘 상태)
  const updatedGroups = localGroups.filter((g) => originalGroupIds.includes(g.chck_uuid));
  for (const g of updatedGroups) {
    const orig = originalGroups.find((o) => o.chck_uuid === g.chck_uuid);
    if (orig && orig.chck_name === g.chck_name && orig.chck_clpd === g.chck_clpd) continue;
    const { error } = await supabase
      .from("todo_chck")
      .update({ chck_name: g.chck_name, chck_clpd: g.chck_clpd })
      .eq("chck_uuid", g.chck_uuid);
    if (error) throw error;
  }

  // ── 아이템 diff (그룹 전체를 펼쳐서 처리) ──
  const originalItems = originalGroups.flatMap((g) =>
    (g.todo_chck_item || []).map((it) => ({ ...it, _chck_uuid: g.chck_uuid }))
  );
  const localItems = localGroups.flatMap((g) =>
    (g.todo_chck_item || []).map((it) => ({ ...it, _chck_uuid: g.chck_uuid }))
  );
  const originalItemIds = originalItems.map((it) => it.item_uuid);
  const localItemIds = localItems.map((it) => it.item_uuid);

  // 삭제된 아이템 (그룹째로 삭제된 건 위에서 이미 처리됐으므로 제외)
  const deletedItemIds = originalItemIds.filter((id) => {
    if (localItemIds.includes(id)) return false;
    const orig = originalItems.find((it) => it.item_uuid === id);
    return !deletedGroupIds.includes(orig._chck_uuid);
  });
  if (deletedItemIds.length > 0) {
    const { error } = await supabase.from("todo_chck_item").delete().in("item_uuid", deletedItemIds);
    if (error) throw error;
  }

  // 새로 추가된 아이템
  const newItems = localItems.filter((it) => !originalItemIds.includes(it.item_uuid));
  if (newItems.length > 0) {
    const { error } = await supabase.from("todo_chck_item").insert(
      newItems.map((it) => ({
        item_uuid: it.item_uuid,
        chck_uuid: it._chck_uuid,
        item_name: it.item_name,
        item_done: it.item_done,
        item_date: it.item_date,
        item_type: it.item_type,
        item_rslt: it.item_rslt,
      }))
    );
    if (error) throw error;
  }

  // 수정된 아이템
  const updatedItems = localItems.filter((it) => originalItemIds.includes(it.item_uuid));
  for (const it of updatedItems) {
    const orig = originalItems.find((o) => o.item_uuid === it.item_uuid);
    if (
      orig &&
      orig.item_name === it.item_name &&
      orig.item_done === it.item_done &&
      orig.item_date === it.item_date &&
      orig.item_type === it.item_type &&
      orig.item_rslt === it.item_rslt &&
      orig._chck_uuid === it._chck_uuid
    ) continue;

    const { error } = await supabase
      .from("todo_chck_item")
      .update({
        chck_uuid: it._chck_uuid,
        item_name: it.item_name,
        item_done: it.item_done,
        item_date: it.item_date,
        item_type: it.item_type,
        item_rslt: it.item_rslt,
      })
      .eq("item_uuid", it.item_uuid);
    if (error) throw error;
  }

  
}

export async function copyTodoFile(oldPath, newPath) {
  const { error } = await supabase.storage.from("todo_file").copy(oldPath, newPath);
  if (error) throw error;

  const { data } = supabase.storage.from("todo_file").getPublicUrl(newPath);
  return data.publicUrl;
}

/* ────────────────── Daily ToDo 조회 (전체 카드의 체크리스트 아이템) ────────────────── */

export async function fetchAllChckItems() {
  const [cardsRes, subsRes] = await Promise.all([
    supabase
      .from("soos_todo")
      .select(`
        todo_uuid, todo_name, todo_tags, todo_subs,
        todo_chck (
          chck_uuid, chck_name,
          todo_chck_item ( item_uuid, item_name, item_done, item_date, item_type, item_rslt )
        )
      `),
    supabase.from("todo_code").select("*").eq("code_flag", "S"),
  ]);

  const { data, error } = cardsRes;
  if (error) throw error;
  const subs = subsRes.data;
  return data.map((c) => {
    const subInfo = subs?.find((s) => s.code_cdid === c.todo_subs);
    return { ...c, todo_subnm: subInfo?.code_cdnm };
  });
}

export async function updateChckItem(itemUuid, patch) {
  const { error } = await supabase.from("todo_chck_item").update(patch).eq("item_uuid", itemUuid);
  if (error) throw error;
}

/* ────────────────── 카드 알림 조회 (알림 설정한 카드만, 오늘 이후) ────────────────── */

export async function fetchNotiCards() {
  const { data, error } = await supabase
    .from("soos_todo")
    .select("todo_uuid, todo_name, noti_date, noti_time, noti_note")
    .eq("todo_noti", true)
    .gte("noti_date", fmtDate(new Date()));

  if (error) throw error;
  return data;
}