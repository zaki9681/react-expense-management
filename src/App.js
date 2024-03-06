import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Button,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

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
  const [isEditable, setIsEditable] = useState(false);

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
    <>
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">支出管理アプリ</Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <Container maxWidth="md">
        <Box mt={2}>
          {/* 使える金額の表示 */}
          <Typography variant="h5">
            残り: {calculateAvailableAmount()}円
          </Typography>
          <Box mb={2}>
            {/* 変動支出の入力フィールド */}
            <TextField
              fullWidth
              id="standard-size-small"
              label="金額"
              type="number"
              name="amount"
              value={variableExpense.amount}
              onChange={handleVariableExpenseChange}
              margin="normal"
              size="normal"
              variant="standard"
            />
            <TextField
              fullWidth
              label="説明"
              type="text"
              name="text"
              value={variableExpense.text}
              onChange={handleVariableExpenseChange}
              margin="normal"
              size="normal"
              variant="standard"
            />
            <Box mt={1}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleVariableExpenseSubmit}
                disableElevation
              >
                登録
              </Button>
            </Box>
          </Box>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>固定収入/支出を見る</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {/* 編集可能な場合はTextFieldを表示 */}
              {isEditable ? (
                <>
                  <TextField
                    fullWidth
                    label="固定収入"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    margin="normal"
                    size="normal"
                    variant="standard"
                  />
                  <TextField
                    fullWidth
                    label="固定支出"
                    type="number"
                    value={fixedExpenses}
                    onChange={(e) => setFixedExpenses(e.target.value)}
                    margin="dense"
                    size="normal"
                    variant="standard"
                  />
                  <Box mt={1}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={toggleEdit}
                      disableElevation
                    >
                      保存
                    </Button>
                  </Box>
                </>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="固定収入"
                    type="number"
                    value={income}
                    margin="normal"
                    size="normal"
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="固定支出"
                    type="number"
                    value={fixedExpenses}
                    margin="dense"
                    size="normal"
                    variant="filled"
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                  <Box mt={1}>
                    <Button
                      variant="contained"
                      onClick={toggleEdit}
                      disableElevation
                    >
                      編集
                    </Button>
                  </Box>
                </>
              )}
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* 変動支出履歴のテーブル */}
        <TableContainer component={Paper} style={{ marginTop: '1rem' }}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="">日時</TableCell>
                <TableCell>金額</TableCell>
                <TableCell align="">説明</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...variableExpensesHistory]
                .sort((a, b) => b.id - a.id)
                .map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell align="">{formatDate(expense.id)}</TableCell>
                    <TableCell component="th" scope="row" align="right">
                      {expense.amount}円
                    </TableCell>
                    <TableCell align="">{expense.text}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </>
  );
};

export default App;
