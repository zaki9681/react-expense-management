import React, { useState, useEffect } from 'react';

// 日時をフォーマットするための関数
const formatDate = (timestamp) => {
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(timestamp).toLocaleString('ja-JP', options);
};

// ローカルストレージから値を取得するヘルパー関数
const getLocalStorageItem = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

const App = () => {
  // ステートの定義
  // 固定収入、固定支出、変動支出の詳細（金額とテキスト）、変動支出の履歴
  const [income, setIncome] = useState(() => getLocalStorageItem('income', ''));

  const [fixedExpenses, setFixedExpenses] = useState(() =>
    getLocalStorageItem('fixedExpenses', '')
  );

  // 変動支出の入力フィールドの状態を追加
  const [variableExpense, setVariableExpense] = useState({
    amount: '',
    text: '',
  });

  // 変動支出の歴状態を追加
  const [variableExpensesHistory, setVariableExpensesHistory] = useState(() =>
    getLocalStorageItem('variableExpensesHistory', [])
  );

  // 編集可能かどうかの状態を追加
  const [isEditable, setIsEditable] = useState(true);

  // ステートが更新されたらローカルストレージに保存する
  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(income));
    localStorage.setItem('fixedExpenses', JSON.stringify(fixedExpenses));
    localStorage.setItem(
      'variableExpensesHistory',
      JSON.stringify(variableExpensesHistory)
    );
  }, [income, fixedExpenses, variableExpensesHistory]);

  // 固定収入と固定支出の編集状態を切り替えるハンラー
  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

  // 変動支出の金額と説明を更新するハンドラー
  const handleVariableExpenseChange = (e) => {
    const { name, value } = e.target;
    setVariableExpense((prev) => ({ ...prev, [name]: value }));
  };

  // 変動支出を登録するハンドラー
  const handleVariableExpenseSubmit = () => {
    if (variableExpense.amount && variableExpense.text) {
      const newHistory = [
        ...variableExpensesHistory,
        { ...variableExpense, id: Date.now() }, // idとして現在時刻を使用
      ];
      setVariableExpensesHistory(newHistory);
      setVariableExpense({ amount: '', text: '' }); // 入力フィールドをリセット
    }
  };

  // 使える金額を計算する関数
  const calculateAvailableAmount = () => {
    const totalVariableExpenses = variableExpensesHistory.reduce(
      (total, expense) => total + Number(expense.amount),
      0
    );
    return Number(income) - Number(fixedExpenses) - totalVariableExpenses;
  };

  return (
    <div>
      <h1>収支管理アプリ</h1>
      {/* 固定収入と固定支出の入力フィールド */}
      {/* 編集可能場合にのみ入力フィールドを表示 */}
      {isEditable ? (
        <>
          <div>
            <label>固定収入:</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
          <div>
            <label>固定支出:</label>
            <input
              type="number"
              value={fixedExpenses}
              onChange={(e) => setFixedExpenses(e.target.value)}
            />
          </div>
          <button
            className=""
            onClick={toggleEdit}
          >
            保存
          </button>
        </>
      ) : (
        <>
          <p>固定収入: {income}円</p>
          <p>固定支出: {fixedExpenses}円</p>
          <button onClick={toggleEdit}>編集</button>
        </>
      )}

      {/* 変動支出の入力フィールド */}
      <div>
        <label>金額:</label>
        <input
          type="number"
          name="amount"
          value={variableExpense.amount}
          onChange={handleVariableExpenseChange}
        />
        <label>説明:</label>
        <input
          type="text"
          name="text"
          value={variableExpense.text}
          onChange={handleVariableExpenseChange}
        />
        <button onClick={handleVariableExpenseSubmit}>登録</button>
      </div>

      {/* 使える金額の表示 */}
      <div>
        <h2>使える金額: {calculateAvailableAmount()}円</h2>
      </div>

      {/* 変動支出履歴のテーブル */}
      <div>
        <h3>変動支出履歴</h3>
        <table>
          <thead>
            <tr>
              <th>金額</th>
              <th>説明</th>
              <th>日時</th>
            </tr>
          </thead>
          <tbody>
            {/* 履歴を降順にソートして表示 */}
            {[...variableExpensesHistory]
              .sort((a, b) => b.id - a.id)
              .map((expense) => (
                <tr key={expense.id}>
                  <td>{expense.amount}円</td>
                  <td>{expense.text}</td>
                  <td>{formatDate(expense.id)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
